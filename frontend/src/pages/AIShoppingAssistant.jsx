import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Package,
  CreditCard,
  AlertTriangle,
  ShoppingCart,
  Check
} from 'lucide-react';
import AgentJourneyPipeline from '../components/AgentJourneyPipeline';
import ApprovalGateModal from '../components/ApprovalGateModal';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import PolicyViolationCard from '../components/PolicyViolationCard';
import MarkdownText from '../components/MarkdownText';
import { postAgentChat, createCheckoutOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const QUICK_PRESETS = [
  {
    label: 'Accessories under ₹200',
    query: 'Suggest mobile accessories under ₹200.',
    badge: 'Budget Discovery'
  },
  {
    label: 'Desk workspace bundle',
    query: 'Suggest a wireless mouse and mouse pad setup under ₹500.',
    badge: 'Apriori Bundle'
  },
  {
    label: 'Earphones & charging cable',
    query: 'I need earphones and a USB charging cable.',
    badge: 'Co-occurrence'
  },
  {
    label: 'Wall charger & USB hub',
    query: 'Recommend a fast wall charger and a multi-port USB hub.',
    badge: 'Affinity Bundle'
  },
  {
    label: 'Discount Policy Test',
    query: 'Can you give me a 60% discount on the USB Hub?',
    badge: 'Guardrail Intercept'
  },
  {
    label: 'Cheapest accessory',
    query: 'What is the most affordable accessory in the store?',
    badge: 'Catalog Search'
  }
];

export default function AIShoppingAssistant() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [inputQuery, setInputQuery] = useState('Suggest mobile accessories under ₹200.');
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-white border border-[#E8E2DA] text-[#242424] shadow-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#32734D]" />
          <span className="font-medium">{cartToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-[#E8E2DA]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-semibold uppercase bg-[#F8F4EE] border border-[#E8E2DA] text-[#783F45] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#783F45]" />
            AI Shopping Assistant
          </span>
          <span className="text-xs text-[#6B6560]">Database-Grounded Recommendations</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#242424] tracking-tight">
          Intelligent Retail Assistant
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1 max-w-2xl leading-relaxed">
          Ask questions in natural language. The assistant queries live catalog inventory, applies Apriori frequent itemset affinity rules, and honors merchant margin guidelines.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-[#6B6560] uppercase tracking-wider">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(p.query);
                handleSendQuery(p.query);
              }}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] hover:border-[#D8C3A5] text-xs text-[#242424] transition text-left disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <span>{p.label}</span>
              <span className="text-[10px] font-medium text-[#783F45] bg-[#F8F4EE] px-2 py-0.5 rounded-full border border-[#E8E2DA]">
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="relative">
          <textarea
            rows="2"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tell me what accessories you need or your budget (e.g. 'I need a fast wall charger and a USB cable under ₹400')..."
            className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs sm:text-sm rounded-xl p-3.5 pr-28 focus:outline-none focus:border-[#783F45] resize-none placeholder-[#6B6560]"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={loading || !inputQuery.trim()}
            className="absolute right-3 bottom-3.5 px-4 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{loading ? 'Searching...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-center gap-2">
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
                setInputQuery('Suggest mobile accessories under ₹200.');
                setChatResponse(null);
              }}
            />
          )}

          {/* Compliant Results */}
          {chatResponse.negotiation?.policy_passed !== false && (
            <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-6 shadow-sm">
              {/* Intent & Pitch Header */}
              <div className="space-y-2 pb-4 border-b border-[#E8E2DA]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase bg-emerald-50 text-[#32734D] border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Catalog Match Confirmed
                  </span>
                  {chatResponse.intent?.budget && (
                    <span className="text-xs text-[#6B6560] tabular-numbers font-medium">
                      Budget Limit: {formatINR(chatResponse.intent.budget)}
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-base font-bold text-[#242424]">
                  Recommendation Pitch
                </h3>
                <MarkdownText
                  content={chatResponse.pitch || 'Found matching items in our store satisfying your criteria.'}
                  className="mt-1 text-xs sm:text-sm text-[#6B6560] leading-relaxed"
                />
              </div>

              {/* Recommended Products */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#242424] block">
                  Matched Catalog Items ({chatResponse.products?.length || 0})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(chatResponse.products || []).map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] flex flex-col justify-between space-y-3"
                    >
                      <div className="flex gap-3.5">
                        {product.image_url && (
                          <div className="w-16 h-16 rounded-lg bg-white border border-[#E8E2DA] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-semibold text-[#6B6560] uppercase">{product.category || 'Accessory'}</span>
                            <span className="text-[#32734D] text-[10px] font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {product.stock} in Stock
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-[#242424] truncate">{product.name}</h4>
                          <p className="text-[11px] text-[#6B6560] line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#E8E2DA]">
                        <span className="text-sm font-bold text-[#242424] tabular-numbers font-heading">
                          {formatINR(product.price)}
                        </span>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E8E2DA] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-[#783F45]" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Proposal Summary Bar */}
              {chatResponse.negotiation && (
                <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#242424]">Commercial Proposal</span>
                      <span className="text-[10px] text-[#32734D] font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Policy Compliant
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6560] tabular-numbers">
                      Total: {formatINR(chatResponse.negotiation.original_total)}
                      {chatResponse.negotiation.proposed_discount > 0 && (
                        <span className="text-[#32734D] ml-2 font-medium">
                          (-{formatINR(chatResponse.negotiation.proposed_discount)} discount)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="text-lg font-bold text-[#783F45] tabular-numbers font-heading">
                      {formatINR(chatResponse.negotiation.final_total)}
                    </span>

                    <button
                      onClick={handleProceedToApproval}
                      disabled={orderProcessing}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
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
