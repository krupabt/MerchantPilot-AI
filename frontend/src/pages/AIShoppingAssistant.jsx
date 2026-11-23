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
  Cpu,
  Lock,
  ShoppingCart,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AgentJourneyPipeline from '../components/AgentJourneyPipeline';
import ApprovalGateModal from '../components/ApprovalGateModal';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import PolicyViolationCard from '../components/PolicyViolationCard';
import { postAgentChat, createCheckoutOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const QUICK_PRESETS = [
  {
    label: 'Laptop for programming under ₹60k',
    query: 'Suggest a laptop under ₹60,000 for programming.',
    badge: 'Hardware Search'
  },
  {
    label: 'Compliant Bundle (Laptop + Mouse)',
    query: 'I need a laptop for programming under ₹65,000 and a mouse.',
    badge: 'Affinity Bundle'
  },
  {
    label: 'Policy Violation Block Demo',
    query: 'I want a laptop. Give me ₹20,000 discount.',
    badge: 'Guardrail Intercept'
  },
  {
    label: 'Studio Audio Headphones',
    query: 'Suggest high-end wireless headphones under ₹60,000.',
    badge: 'Audio Search'
  },
  {
    label: '4K Display & Peripherals',
    query: 'Looking for a 4K monitor and ergonomic mouse under ₹40,000.',
    badge: 'Workstation Setup'
  }
];

export default function AIShoppingAssistant() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [inputQuery, setInputQuery] = useState('Suggest a laptop under ₹60,000 for programming.');
  const [loading, setLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState(null);
  const [error, setError] = useState(null);
  const [cartToast, setCartToast] = useState('');

  // Modals State
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [settledPayment, setSettledPayment] = useState(null);

  const handleSendQuery = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError(null);
    setChatResponse(null);
    setSettledPayment(null);

    try {
      const res = await postAgentChat({
        message: q,
        session_id: `sess_ai_${Date.now()}`
      });
      setChatResponse(res.data);
    } catch (err) {
      console.error('AI query error:', err);
      setError(err.response?.data?.detail || 'Failed to communicate with AI Shopping Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      setCartToast('Please sign in to add items to your cart.');
      setTimeout(() => setCartToast(''), 3500);
      return;
    }
    try {
      await addItem(product.id, 1);
      setCartToast(`Added "${product.name}" to cart!`);
      setTimeout(() => setCartToast(''), 3000);
    } catch (err) {
      setCartToast(err.response?.data?.detail || 'Failed to add item to cart.');
      setTimeout(() => setCartToast(''), 4000);
    }
  };

  const handleProceedToApproval = () => {
    setIsApprovalOpen(true);
  };

  const handleApproveProposal = async () => {
    setIsApprovalOpen(false);
    setOrderProcessing(true);

    try {
      const items = (chatResponse?.products || []).map((p) => ({
        product_id: p.id,
        product_name: p.name,
        quantity: 1,
        unit_price: p.price
      }));

      const payload = {
        session_id: `sess_ai_checkout_${Date.now()}`,
        items: items,
        discount_amount: chatResponse?.negotiation?.proposed_discount || 0,
        bundle_name: chatResponse?.bundle_name || 'AI Assistant Bundle',
        is_bundle: items.length > 1,
        approval_token: chatResponse?.negotiation?.approval_token
      };

      const res = await createCheckoutOrder(payload);
      setCreatedOrderData(res.data);
      setIsCheckoutOpen(true);
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.detail || 'Failed to register order with Razorpay.');
    } finally {
      setOrderProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1C222B] border border-[#F5A524] text-[#F8FAFC] shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{cartToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-[#2A3441]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Shopping Assistant
          </span>
          <span className="text-xs text-[#94A3B8] font-mono">Zero Hallucination • Live Database Grounded</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
          Autonomous Hardware Shopping Assistant
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
          Type your hardware requirements and budget. The assistant extracts specs, verifies live stock in the database, runs association rule mining for accessories, and enforces merchant policy boundaries.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Try an example inquiry:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(p.query);
                handleSendQuery(p.query);
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] hover:border-[#F5A524]/50 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition text-left disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{p.label}</span>
              <span className="text-[9px] font-mono text-[#F5A524] bg-[#0B0F14] px-1.5 py-0.2 rounded border border-[#2A3441]">
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="surface-card p-4 space-y-3">
        <div className="relative">
          <textarea
            rows="2"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tell me what you need (e.g. 'Suggest a laptop under ₹60,000 for programming and a wireless mouse')..."
            className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl p-3.5 pr-24 focus:outline-none focus:border-[#F5A524] resize-none"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={loading || !inputQuery.trim()}
            className="absolute right-3 bottom-3.5 px-4 py-2 rounded-lg bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{loading ? 'Searching...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Pipeline Display */}
      {chatResponse && (
        <div className="space-y-6 animate-in fade-in">
          {/* Step-by-Step Architecture Pipeline */}
          <AgentJourneyPipeline
            activeStep={chatResponse.negotiation?.policy_passed === false ? 6 : 7}
            isBlocked={chatResponse.negotiation?.policy_passed === false}
          />

          {/* Policy Violation Card if Blocked */}
          {chatResponse.negotiation?.policy_passed === false && (
            <PolicyViolationCard
              policyEvaluation={chatResponse.policy_evaluation || chatResponse.negotiation}
              onReset={() => {
                setInputQuery('Suggest a laptop under ₹60,000 for programming.');
                setChatResponse(null);
              }}
            />
          )}

          {/* Compliant Results */}
          {chatResponse.negotiation?.policy_passed !== false && (
            <div className="surface-card p-6 space-y-6">
              {/* Intent & Pitch Header */}
              <div className="space-y-2 pb-4 border-b border-[#2A3441]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
                    Catalog Match Confirmed
                  </span>
                  {chatResponse.intent?.budget && (
                    <span className="text-xs text-[#94A3B8] font-mono">
                      Budget Cap: ₹{chatResponse.intent.budget.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Recommendation Pitch
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {chatResponse.pitch || 'Found matching hardware products in our catalog satisfying your criteria.'}
                </p>
              </div>

              {/* Recommended Hardware Products */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase text-[#F8FAFC] block">
                  Matched Catalog Items ({chatResponse.products?.length || 0})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(chatResponse.products || []).map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[#F5A524] text-[10px] font-bold">{product.id}</span>
                          <span className="text-[#10B981] font-mono text-[10px] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                            {product.stock} in Stock
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F8FAFC]">{product.name}</h4>
                        <p className="text-[11px] text-[#94A3B8] line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2A3441]">
                        <span className="text-sm font-bold text-[#F8FAFC]">
                          ₹{product.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-3 py-1.5 rounded-lg bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#F8FAFC] text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-[#F5A524]" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Proposal Summary Bar */}
              {chatResponse.negotiation && (
                <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F8FAFC]">Commercial Proposal</span>
                      <span className="text-[10px] text-[#10B981] font-mono bg-[#10B981]/10 px-2 py-0.5 rounded">
                        Policy Compliant
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      Total: ₹{chatResponse.negotiation.original_total?.toLocaleString('en-IN')}
                      {chatResponse.negotiation.proposed_discount > 0 && (
                        <span className="text-[#10B981] ml-2">
                          (-₹{chatResponse.negotiation.proposed_discount?.toLocaleString('en-IN')} discount)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-lg font-black text-[#F5A524]">
                      ₹{chatResponse.negotiation.final_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                    <button
                      onClick={handleProceedToApproval}
                      disabled={orderProcessing}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-amber-glow flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Review & Checkout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Approval Gate Modal */}
      {chatResponse?.negotiation && (
        <ApprovalGateModal
          isOpen={isApprovalOpen}
          onClose={() => setIsApprovalOpen(false)}
          offer={chatResponse?.offer || {
            items: (chatResponse?.products || []).map(p => ({
              name: p.name,
              quantity: 1,
              unit_price: p.price,
              total_price: p.price
            })),
            original_total: chatResponse?.negotiation?.original_total,
            discount_amount: chatResponse?.negotiation?.proposed_discount,
            discount_percentage: chatResponse?.negotiation?.discount_percentage,
            final_amount: chatResponse?.negotiation?.final_total
          }}
          policyEvaluation={chatResponse?.policy_evaluation || chatResponse?.negotiation}
          onApprove={handleApproveProposal}
          loading={orderProcessing}
        />
      )}

      {/* Razorpay Settlement Modal */}
      {createdOrderData && (
        <RazorpayCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          orderData={createdOrderData}
          onPaymentSuccess={(settled) => setSettledPayment(settled)}
        />
      )}
    </div>
  );
}
