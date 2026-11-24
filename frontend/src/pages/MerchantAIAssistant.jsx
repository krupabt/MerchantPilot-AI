import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Layers,
  Database,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Package,
  Clock,
  ArrowUpRight,
  Lightbulb,
  Truck,
  Zap
} from 'lucide-react';
import { postMerchantAIAssistant } from '../services/api';

const PRESET_QUERIES = [
  'Which products are low in stock?',
  'Compare our sales performance over the last 7 days',
  'What is our stock runway and replenishment requirements?',
  'What were my best-selling products?',
  'What products are slow-moving or dead stock?',
  'What is our total revenue & average order value?',
  'How many orders are unfulfilled or pending?',
  'What products are frequently bought together?',
  'Give me proactive action recommendations to protect revenue'
];

export default function MerchantAIAssistant() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your MerchantPilot AI Business Copilot. I analyze your sales, inventory velocity, order fulfillment, and basket affinities by querying your live database records with zero hallucination. Ask a question below or pick a preset.',
      data: null,
      query_type: 'WELCOME',
      actionable_recommendations: []
    }
  ]);

  useEffect(() => {
    if (location.state?.prefilledQuery) {
      handleSendQuery(location.state.prefilledQuery);
    }
  }, [location.state]);

  const handleSendQuery = async (queryText) => {
    const q = queryText || query;
    if (!q.trim() || loading) return;

    // Append user question
    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn understanding
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await postMerchantAIAssistant({
        query: q,
        history: historyPayload
      });
      const answerData = res.data;

      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: answerData.answer || 'Query processed.',
          data: answerData.data,
          query_type: answerData.query_type || answerData.intent,
          structured_table: answerData.structured_table,
          actionable_recommendations: answerData.actionable_recommendations || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: 'Unable to process query against database: ' + (err.response?.data?.detail || err.message),
          data: null,
          query_type: 'ERROR',
          actionable_recommendations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3" />
              SQL-Grounded Business Copilot
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Zero Hallucination • Relational DB Grounded</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Merchant AI Business Copilot</h1>
          <p className="text-xs text-[#94A3B8]">
            Ask plain English questions to diagnose sales velocity, evaluate reorder alerts, inspect dead stock, and make data-driven decisions.
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Quick Question Presets:</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset}
              onClick={() => handleSendQuery(preset)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] hover:border-[#F5A524]/50 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition text-left disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="surface-card p-6 min-h-[440px] max-h-[600px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#F5A524] text-black font-sans'
                    : 'bg-[#151A21] border border-[#2A3441] text-[#F5A524]'
                }`}
              >
                {isUser ? 'ME' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 ${
                  isUser
                    ? 'bg-[#F5A524] text-black font-medium'
                    : 'bg-[#151A21] border border-[#2A3441] text-[#F8FAFC]'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Structured Data Visualization for Low Stock */}
                {msg.query_type === 'LOW_STOCK_ALERT' && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div className="rounded-xl bg-[#1C222B] border border-[#2A3441] p-3 text-xs space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#F59E0B] uppercase font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low-Stock Replenishment Queue
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">{msg.data.length} SKU(s) flagged</span>
                    </div>
                    <div className="divide-y divide-[#2A3441]">
                      {msg.data.map((item) => (
                        <div key={item.id} className="py-2 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-semibold text-[#F8FAFC]">{item.name}</span>
                            <span className="text-[#94A3B8] font-mono block text-[10px]">SKU: {item.id} • Category: {item.category}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                              item.stock <= 0 ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            }`}>
                              {item.status || `${item.stock} left`}
                            </span>
                            <span className="text-[#94A3B8] block text-[9px] font-mono mt-0.5">Threshold: {item.threshold || item.low_stock_threshold}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Selling Products Visual Card */}
                {msg.query_type === 'TOP_SELLING_PRODUCTS' && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div className="rounded-xl bg-[#1C222B] border border-[#2A3441] p-3 text-xs space-y-2 mt-2">
                    <span className="font-mono text-[10px] text-[#10B981] uppercase font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Top Performing Items by Sales Volume
                    </span>
                    <div className="divide-y divide-[#2A3441]">
                      {msg.data.map((item, i) => (
                        <div key={item.product_id || i} className="py-2 flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#151A21] border border-[#2A3441] flex items-center justify-center font-mono font-bold text-[10px] text-[#F5A524]">
                              #{i + 1}
                            </span>
                            <div>
                              <span className="font-semibold text-[#F8FAFC]">{item.name}</span>
                              <span className="text-[#94A3B8] font-mono block text-[10px]">SKU: {item.product_id}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#F8FAFC] block">{item.revenue}</span>
                            <span className="text-[#10B981] font-mono text-[10px]">{item.units_sold} units sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Slow Moving / Dead Stock Visual Card */}
                {msg.query_type === 'SLOW_MOVING_PRODUCTS' && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div className="rounded-xl bg-[#1C222B] border border-[#2A3441] p-3 text-xs space-y-2 mt-2">
                    <span className="font-mono text-[10px] text-[#EF4444] uppercase font-bold flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Stagnant Inventory & Liquid Capital Risk
                    </span>
                    <div className="divide-y divide-[#2A3441]">
                      {msg.data.map((item, i) => (
                        <div key={item.id || i} className="py-2 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-semibold text-[#F8FAFC]">{item.name}</span>
                            <span className="text-[#94A3B8] font-mono block text-[10px]">Units Sold: {item.units_sold} • Stock: {item.stock}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#EF4444] block font-mono">{item.tied_capital}</span>
                            <span className="text-[#94A3B8] font-mono text-[9px]">Tied-up Capital</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Data Visualization for Revenue / AOV / Copilot Summary */}
                {(msg.query_type === 'REVENUE_SUMMARY' || msg.query_type === 'AVERAGE_ORDER_VALUE' || msg.query_type === 'BUSINESS_COPILOT_INSIGHTS') && msg.data && typeof msg.data === 'object' && !Array.isArray(msg.data) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {msg.data.total_revenue !== undefined && (
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Settled Revenue</span>
                        <span className="text-sm font-bold text-[#F8FAFC]">
                          ₹{msg.data.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {(msg.data.total_orders !== undefined || msg.data.completed_orders !== undefined) && (
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Completed Orders</span>
                        <span className="text-sm font-bold text-[#F8FAFC]">{msg.data.total_orders ?? msg.data.completed_orders}</span>
                      </div>
                    )}
                    {msg.data.aov !== undefined && (
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Avg Order Value</span>
                        <span className="text-sm font-bold text-[#F5A524]">
                          ₹{msg.data.aov?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {msg.data.total_discounts_granted !== undefined && (
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Discounts Granted</span>
                        <span className="text-sm font-bold text-[#10B981]">
                          ₹{msg.data.total_discounts_granted?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {msg.data.active_products !== undefined && (
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Active SKUs</span>
                        <span className="text-sm font-bold text-[#F8FAFC]">{msg.data.active_products}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Fulfillment Status Cards */}
                {msg.query_type === 'FULFILLMENT_STATUS' && msg.data && typeof msg.data === 'object' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#EF4444] block font-mono uppercase">Unfulfilled</span>
                      <span className="text-sm font-bold text-[#EF4444]">{msg.data.unfulfilled || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#F5A524] block font-mono uppercase">Processing</span>
                      <span className="text-sm font-bold text-[#F5A524]">{msg.data.processing || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#3B82F6] block font-mono uppercase">Shipped</span>
                      <span className="text-sm font-bold text-[#3B82F6]">{msg.data.shipped || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#10B981] block font-mono uppercase">Delivered</span>
                      <span className="text-sm font-bold text-[#10B981]">{msg.data.delivered || 0}</span>
                    </div>
                  </div>
                )}

                {/* Bundle Recommendations Card */}
                {msg.query_type === 'BUNDLE_RECOMMENDATIONS' && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div className="rounded-xl bg-[#1C222B] border border-[#2A3441] p-3 text-xs space-y-2.5 mt-2">
                    <span className="font-mono text-[10px] text-[#F5A524] uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Affinity Bundles & Cross-Sell Opportunities
                    </span>
                    <div className="space-y-2">
                      {msg.data.map((b, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-[#151A21] border border-[#2A3441] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#F8FAFC]">{b.bundle_title}</span>
                            <span className="text-[#10B981] font-mono font-bold">{b.bundle_price}</span>
                          </div>
                          <div className="text-[10px] text-[#94A3B8] flex items-center gap-2">
                            <span>Catalog: {b.original_price}</span>
                            <span className="text-[#F5A524] font-semibold">{b.discount}</span>
                          </div>
                          <p className="text-[10px] text-[#64748B] italic">{b.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Table for Period Comparison, Runway, Proactive Actions */}
                {msg.structured_table && Array.isArray(msg.structured_table.headers) && Array.isArray(msg.structured_table.rows) && msg.structured_table.rows.length > 0 && (
                  <div className="rounded-xl bg-[#1C222B] border border-[#2A3441] p-3 text-xs space-y-2 mt-2 overflow-x-auto">
                    {msg.structured_table.title && (
                      <span className="font-mono text-[10px] text-[#F5A524] uppercase font-bold flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {msg.structured_table.title}
                      </span>
                    )}
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#151A21] text-[#94A3B8] font-mono uppercase text-[9px] border-b border-[#2A3441]">
                        <tr>
                          {msg.structured_table.headers.map((h, i) => (
                            <th key={i} className="py-1.5 px-2.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A3441]">
                        {msg.structured_table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[#151A21]/50">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="py-1.5 px-2.5 text-[11px] font-mono text-[#F8FAFC]">
                                {typeof val === 'number' ? val.toLocaleString('en-IN') : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Direct Action Center Link if Merchant Actions */}
                {msg.query_type === 'MERCHANT_ACTIONS' && (
                  <div className="pt-2">
                    <Link
                      to="/actions"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A524] hover:bg-[#D97706] text-black text-xs font-bold transition shadow-amber-glow"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Review & Execute in Action Center →</span>
                    </Link>
                  </div>
                )}

                {/* Actionable Recommendations Pills */}
                {Array.isArray(msg.actionable_recommendations) && msg.actionable_recommendations.length > 0 && (
                  <div className="pt-2 border-t border-[#2A3441] space-y-1.5">
                    <span className="text-[10px] font-mono text-[#F5A524] uppercase font-bold flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Copilot Action Directives:
                    </span>
                    <ul className="space-y-1">
                      {msg.actionable_recommendations.map((rec, i) => (
                        <li key={i} className="text-[11px] text-[#94A3B8] flex items-start gap-1.5">
                          <span className="text-[#10B981] font-bold">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#151A21] border border-[#2A3441] flex items-center justify-center text-[#F5A524]">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-[#151A21] border border-[#2A3441] rounded-2xl px-4 py-3 text-xs text-[#94A3B8] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#F5A524] animate-spin" />
              <span>Querying live database records and calculating business metrics...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask a question about sales, inventory velocity, dead stock, or fulfillment (e.g. 'What products are low in stock?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="flex-1 bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A524] transition placeholder-[#64748B]"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask Copilot</span>
        </button>
      </form>
    </div>
  );
}
