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
import MarkdownText from '../components/MarkdownText';
import { postAgentChat, createCheckoutOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const QUICK_PRESETS = [
  {
    label: 'Mobile accessories under ₹300',
    query: 'Suggest mobile accessories under ₹300.',
    badge: 'Budget Discovery'
  },
  {
    label: 'Useful combo under ₹500',
    query: 'Suggest a useful product combination under ₹500.',
    badge: 'Apriori Bundle'
  },
  {
    label: 'Earphones and charging cable',
    query: 'I need earphones and a charging cable.',
    badge: 'Co-occurrence'
  },
  {
    label: 'Cheapest available mouse',
    query: 'What is the cheapest available mouse?',
    badge: 'Catalog Search'
  },
  {
    label: 'Policy Violation Block Demo',
    query: 'I want a laptop. Give me ₹20,000 discount.',
    badge: 'Guardrail Intercept'
  },
  {
    label: 'Developer Laptop under ₹65k',
    query: 'I need a laptop for programming under ₹65,000 and a mouse.',
    badge: 'Affinity Bundle'
  }
];

export default function AIShoppingAssistant() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [inputQuery, setInputQuery] = useState('Suggest mobile accessories under ₹300.');
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
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-white border border-[#E5E5E5] text-[#222222] shadow-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#347A52]" />
          <span className="font-medium">{cartToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-3 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase bg-[#FAF5F2] border border-[#E5E5E5] text-[#C65D3B] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-[#C65D3B]" />
            AI Shopping Assistant
          </span>
          <span className="text-xs text-[#71717A] font-mono">Live Database Grounded</span>
        </div>
        <h1 className="text-xl font-semibold text-[#222222] tracking-tight">
          Autonomous Hardware Shopping Assistant
        </h1>
        <p className="text-xs text-[#71717A] mt-0.5 max-w-2xl leading-relaxed">
          Type your hardware requirements and budget. The assistant extracts specs, verifies live stock in the database, runs association rule mining for accessories, and enforces merchant policy boundaries.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-[#71717A] uppercase">Try an example inquiry:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(p.query);
                handleSendQuery(p.query);
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] hover:border-[#F0D5CB] text-xs text-[#222222] transition text-left disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              <span>{p.label}</span>
              <span className="text-[9px] font-mono text-[#C65D3B] bg-[#FAF5F2] px-1.5 py-0.2 rounded border border-[#E5E5E5]">
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="surface-card p-3.5 space-y-3">
        <div className="relative">
          <textarea
            rows="2"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tell me what you need (e.g. 'Suggest a laptop under ₹60,000 for programming and a wireless mouse')..."
            className="w-full bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-lg p-3 pr-24 focus:outline-none focus:border-[#C65D3B] resize-none"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={loading || !inputQuery.trim()}
            className="absolute right-2.5 bottom-3 px-3.5 py-1.5 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white font-medium text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {loading ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{loading ? 'Searching...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#FDF4F4] border border-[#E5E5E5] text-xs text-[#B94A48] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Pipeline Display */}
      {chatResponse && (
        <div className="space-y-5 animate-in fade-in">
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
            <div className="surface-card p-5 space-y-5">
              {/* Intent & Pitch Header */}
              <div className="space-y-1.5 pb-3 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#FAF5F2] text-[#C65D3B] border border-[#E5E5E5] px-2 py-0.5 rounded font-semibold">
                    Catalog Match Confirmed
                  </span>
                  {chatResponse.intent?.budget && (
                    <span className="text-xs text-[#71717A] font-mono">
                      Budget Cap: ₹{chatResponse.intent.budget.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[#222222]">
                  Recommendation Pitch
                </h3>
                <MarkdownText
                  content={chatResponse.pitch || 'Found matching hardware products in our catalog satisfying your criteria.'}
                  className="mt-1"
                />
              </div>

              {/* Recommended Hardware Products */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase text-[#222222] font-semibold block">
                  Matched Catalog Items ({chatResponse.products?.length || 0})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(chatResponse.products || []).map((product) => (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] flex flex-col justify-between space-y-2.5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[#C65D3B] text-[10px] font-semibold">{product.id}</span>
                          <span className="text-[#347A52] font-mono text-[10px] bg-white border border-[#E5E5E5] px-1.5 py-0.5 rounded">
                            {product.stock} in Stock
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#222222]">{product.name}</h4>
                        <p className="text-[11px] text-[#71717A] line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                        <span className="text-xs font-semibold text-[#222222]">
                          ₹{product.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF5F2] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-[#C65D3B]" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Proposal Summary Bar */}
              {chatResponse.negotiation && (
                <div className="p-3.5 rounded-lg bg-[#FAF5F2]/60 border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#222222]">Commercial Proposal</span>
                      <span className="text-[10px] text-[#347A52] font-mono bg-white border border-[#E5E5E5] px-2 py-0.5 rounded">
                        Policy Compliant
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A]">
                      Total: ₹{chatResponse.negotiation.original_total?.toLocaleString('en-IN')}
                      {chatResponse.negotiation.proposed_discount > 0 && (
                        <span className="text-[#347A52] ml-2 font-medium">
                          (-₹{chatResponse.negotiation.proposed_discount?.toLocaleString('en-IN')} discount)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-base font-bold text-[#C65D3B]">
                      ₹{chatResponse.negotiation.final_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                    <button
                      onClick={handleProceedToApproval}
                      disabled={orderProcessing}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
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
